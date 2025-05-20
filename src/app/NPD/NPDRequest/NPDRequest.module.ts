import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { NPDRequestRoutingModule } from './NPDRequest-routing.module';
import { NPDRequestComponent } from './NPDRequest.component';

@NgModule({
  imports: [
    CommonModule,
    
    FormsModule,
    SharedmoduleModule,
    NPDRequestRoutingModule
  ],
  declarations: [NPDRequestComponent],
  providers:[DatePipe]
})
export class NPDRequestModule { }
