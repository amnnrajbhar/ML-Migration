import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DocDestructionRoutingModule } from './DocDestruction-routing.module';
import { DocDestructionComponent } from './DocDestruction.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DocDestructionRoutingModule
  ],
  declarations: [DocDestructionComponent],
  providers:[DatePipe]
})
export class DocDestructionModule { }
