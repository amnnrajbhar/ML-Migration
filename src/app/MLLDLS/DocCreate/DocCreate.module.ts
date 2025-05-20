import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DocCreateRoutingModule } from './DocCreate-routing.module';
import { DocCreateComponent } from './DocCreate.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DocCreateRoutingModule
  ],
  declarations: [DocCreateComponent],
  providers:[DatePipe]
})
export class DocCreateModule { }
