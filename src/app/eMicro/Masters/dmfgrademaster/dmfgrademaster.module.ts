import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { DmfGradeComponent } from './dmfgrademaster.component';
import { DmfGradeRoutingModule } from './dmfgrademaster-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        DmfGradeRoutingModule
    ],
    declarations: [
        DmfGradeComponent
    ]
})
export class DmfGradeModule { }
