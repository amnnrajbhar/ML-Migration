import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ReportsComponent } from './Reports.component';
import { ReportsRoutingModule } from './Reports-routing.module';
import { ItemCodeCreationComponent } from '../ItemCodeCreation/ItemCodeCreation.component';
import { AppComponent } from '../../app.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ReportsRoutingModule,
    ],
    declarations: [
        ReportsComponent
    ],
    providers:[
        ItemCodeCreationComponent,AppComponent
    ]
})
export class ReportsModule { }
