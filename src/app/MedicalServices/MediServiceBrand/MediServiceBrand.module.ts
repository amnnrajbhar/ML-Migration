import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MediServiceBrandRoutingModule } from './MediServiceBrand-routing.module';
import { MediServiceBrandComponent } from './MediServiceBrand.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    MediServiceBrandRoutingModule
  ],
  declarations: [MediServiceBrandComponent]
})
export class MediServiceBrandModule { }
