import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GereturnableclosurereportRoutingModule } from './gereturnableclosurereport-routing.module';
import { GereturnableclosurereportComponent } from './gereturnableclosurereport.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GereturnableclosurereportRoutingModule
  ],
  declarations: [GereturnableclosurereportComponent]
})
export class GereturnableclosurereportModule { }
