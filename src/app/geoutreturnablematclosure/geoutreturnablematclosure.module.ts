import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';
import { GEOutRetMatClosureRoutingModule } from './geoutreturnablematclosure-routing.module';
import { GEOutRetMatClosureComponent } from './geoutreturnablematclosure.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GEOutRetMatClosureRoutingModule
  ],
  declarations: [
    GEOutRetMatClosureComponent
  ]
})
export class GEOutRetMatClosureModule { }
