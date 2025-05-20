import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { PharmaGradeRoutingModule } from './PharmacopeialGrade-routing.module';
import { PharmaGradeComponent } from './PharmacopeialGrade.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        PharmaGradeRoutingModule
    ],
    declarations: [
        PharmaGradeComponent
    ]
})
export class PharmaGradeModule { }
