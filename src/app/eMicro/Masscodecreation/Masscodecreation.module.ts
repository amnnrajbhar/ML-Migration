import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MassCodeCreationRoutingModule } from './Masscodecreation-routing.module';
import { MassCodeCreationComponent } from './Masscodecreation.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        MassCodeCreationRoutingModule
    ],
    declarations: [
        MassCodeCreationComponent
    ]
})
export class MassCodeCreationModule { }
