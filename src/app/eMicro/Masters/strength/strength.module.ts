import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { StrengthRoutingModule } from './strength-routing.module';
import { StrengthComponent } from './strength.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        StrengthRoutingModule
    ],
    declarations: [
        StrengthComponent
    ]
})
export class StrengthModule { }
