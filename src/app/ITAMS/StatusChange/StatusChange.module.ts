import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatusChangeComponent } from './StatusChange.component';
import { StatusChangeRoutingModule } from './StatusChange-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        StatusChangeRoutingModule
    ],
    declarations: [
        StatusChangeComponent
    ]
})
export class StatusChangeModule { }
