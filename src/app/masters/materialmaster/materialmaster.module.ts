import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialmasterRoutingModule } from './materialmaster-routing.module';
import { MaterialmasterComponent } from './materialmaster.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MaterialmasterRoutingModule,
    SharedmoduleModule
  ],
  declarations: [MaterialmasterComponent]
})
export class MaterialmasterModule { }
