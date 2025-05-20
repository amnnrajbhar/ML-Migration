import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DesignationComponent } from './designation.component';
import { DesignationRoutingModule } from './designation-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        DesignationRoutingModule
    ],
    declarations: [
        DesignationComponent
    ]
})
export class DesignationModule { }
