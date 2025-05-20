import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GESearchRoutingModule } from './gateentrysearch-routing.module';
import { GateentrysearchComponent } from './gateentrysearch.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        GESearchRoutingModule
    ],
    declarations: [
        GateentrysearchComponent
    ]
})
export class GESearchModule { }
