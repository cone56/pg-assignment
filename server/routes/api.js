const express = require('express')
const router = express.Router()

// Endpoint: /api
router.all('/', function (req, res) {
  // Modules required for this route
  const fs = require('fs')
  const readline = require('readline')
  const pathModule = require('path')
  const es = require('event-stream')

  // Return object
  let response = {}
  let errors = []

  // CHECK 0: validate request method
  if (req.method !== 'GET') {
    response = {
      success: false,
      error: {
        code: 405,
        message: 'Request method must be GET'
      }
    }
    return res
      .status(response.error.code)
      .set('Allow', 'GET')
      .json(response)
  }

  // CHECK 1: validate all query string params are provided
  if (!req.query || !req.query.path) {
    errors.push({
      param: 'path',
      required: true
    })
  }

  if (!req.query || !req.query.page) {
    errors.push({
      param: 'page',
      required: true
    })
  }

  if (!req.query || !req.query.perPage) {
    errors.push({
      param: 'perPage',
      required: true
    })
  }

  if (errors.length) {
    response = {
      success: false,
      error: {
        code: 400,
        message: 'Request parameters are missing',
        details: errors
      }
    }
    return res.status(response.error.code).json(response)
  }

  // CHECK 2: validate data types and ranges
  req.query.page = parseInt(req.query.page)
  if (isNaN(req.query.page) || req.query.page < 1) {
    errors.push({
      param: 'page',
      type: 'int',
      min: 1
    })
  }

  req.query.perPage = parseInt(req.query.perPage)
  if (isNaN(req.query.perPage) || req.query.perPage < 1 || req.query.perPage > 100) {
    errors.push({
      param: 'perPage',
      type: 'int',
      min: 1,
      max: 100
    })
  }

  if (errors.length) {
    response = {
      success: false,
      error: {
        code: 400,
        message: 'Request parameters have bad data types or incorrect values',
        details: errors
      }
    }
    return res.status(response.error.code).json(response)
  }

  // CHECK 3: check the path begins with /var/logs and doesn't contain any nasty
  // characters such as ../../ to allow the user to escape the whitelisted paths
  req.query.path = pathModule.normalize(req.query.path)
  const whitelistedPaths = [
    '/var/temp',
    '/var/log',
    'C:\temp'
  ]
  let invalidDirectory = true
  for (let i = 0; i < whitelistedPaths.length; i++) {
    if (req.query.path.startsWith(whitelistedPaths[i])) {
      invalidDirectory = false
      break
    }
  }
  if (!pathModule.isAbsolute(req.query.path) || invalidDirectory) {
    response = {
      success: false,
      error: {
        code: 400,
        message: 'File path not allowed',
        detail: `File path must be absolute and must be located in these typical directories: ${whitelistedPaths.join(', ')}`
      }
    }
    return res.status(response.error.code).json(response)
  }

  // CHECK 4: validate the path exists and is a file
  if (!fs.existsSync(req.query.path) || !fs.statSync(req.query.path).isFile()) {
    response = {
      success: false,
      error: {
        code: 400,
        message: 'No such file',
        detail: `File at path ${req.query.path} does not exist`
      }
    }
    return res.status(response.error.code).json(response)
  }

  // CHECK 5: Check for read permissions
  try {
    fs.accessSync(req.query.path, fs.constants.R_OK)
  } catch (e) {
    response = {
      success: false,
      error: {
        code: 400,
        message: 'Permission denied',
        detail: 'You do not have permission to read this file'
      }
    }
    return res.status(response.error.code).json(response)
  }

  // Work out which line ranges we need to return
  let startLine = req.query.page * req.query.perPage - req.query.perPage + 1
  let endLine = req.query.page * req.query.perPage

  // Line variables
  let lineCount = 0
  let lines = []

  // Open the log file as file as buffered readable stream
  let readStream = fs.createReadStream(req.query.path, {
    flags: 'r',
    encoding: 'utf-8',
    bufferSize: 64 * 1024
  })

  readStream.on('error', err => {
    response = {
      success: false,
      error: {
        code: 500,
        message: 'Read stream error',
        detail: err.message()
      }
    }
    return res.status(response.error.code).json(response)
  })

  readStream.pipe(es.split('\n')).pipe(es.mapSync(line => {
    ++lineCount
    if (lineCount >= startLine && lineCount <= endLine) {
      lines.push(line)
    }
  }))

  readStream.on('end', () => {
    const counts = {
      totalLines: lineCount,
      itemsPerPage: req.query.perPage,
      totalPages: Math.ceil(lineCount / req.query.perPage),
      currentPage: req.query.page,
      start: startLine,
      end: Math.min(lineCount, endLine)
    }

    if (counts.currentPage > counts.totalPages) {
      response = {
        success: false,
        error: {
          code: 400,
          message: 'Out of range',
          detail: `Lines requested are outside the range of the file. Max page range is: ${counts.totalPages}`
        }
      }
      return res.status(response.error.code).json(response)
    }

    // FINAL SUCCESS!
    return res.status(200).json({lines, counts})
  })
})

module.exports = router
