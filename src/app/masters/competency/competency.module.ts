import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetencyComponent } from './competency.component';
import { CompetencyRoutingModule } from './competency-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CompetencyRoutingModule,
        SharedmoduleModule
    ],
    declarations: [
        CompetencyComponent
    ]
})
export class CompetencyModule { }
