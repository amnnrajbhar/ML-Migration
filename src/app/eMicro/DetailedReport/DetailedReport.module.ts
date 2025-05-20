import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DetailedReportComponent } from './DetailedReport.component';
import { DetailedReportRoutingModule } from './DetailedReport-routing.module';
import { ItemCodeCreationComponent } from '../ItemCodeCreation/ItemCodeCreation.component';
import { AppComponent } from '../../app.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        DetailedReportRoutingModule,
    ],
    declarations: [
        DetailedReportComponent
    ],
    providers:[
        ItemCodeCreationComponent,AppComponent,DatePipe
    ]
})
export class DetailedReportModule { }
