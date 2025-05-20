import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { RaRequestComponent } from './RaRequest.component';
import { RaRequestRoutingModule } from './RaRequest-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        RaRequestRoutingModule
    ],
    declarations: [
        RaRequestComponent
    ]
})
export class RaRequestModule { }
