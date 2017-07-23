import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LogViewerComponent } from './components/log-viewer/log-viewer.component';

import { DataService } from './services/data.service';

const appRoutes: Routes = [
  { path: '', component: LogViewerComponent },
  { path: '**', redirectTo: '' },
];


@NgModule({
  declarations: [ // components
    AppComponent,
    LogViewerComponent,
  ],
  imports: [ // moudles
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [ // services
    DataService,
  ],
  bootstrap: [
    AppComponent,
  ]
})
export class AppModule { }
