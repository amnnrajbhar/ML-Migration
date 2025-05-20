import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SparesRequestComponent } from './SparesRequest.component';
import { SparesRequestRoutingModule } from './SparesRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        SparesRequestRoutingModule
    ],
    declarations: [
        SparesRequestComponent
    ]
})
export class SparesRequestModule { }
