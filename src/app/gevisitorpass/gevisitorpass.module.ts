import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GevisitorpassComponent } from './gevisitorpass.component';
import { GEVisitorPassRoutingModule } from './gevisitorpass-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        GEVisitorPassRoutingModule
    ],
    declarations: [
        GevisitorpassComponent
    ]
})
export class GEVisiorPassModule { }
