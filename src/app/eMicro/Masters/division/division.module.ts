import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { DivisionRoutingModule } from './division-routing.module';
import { DivisionComponent } from './division.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        DivisionRoutingModule
    ],
    declarations: [
        DivisionComponent
    ]
})
export class DivisionModule { }
