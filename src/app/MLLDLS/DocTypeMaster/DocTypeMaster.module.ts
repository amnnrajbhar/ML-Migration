import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DocTypeMasterRoutingModule } from './DocTypeMaster-routing.module';
import { DocTypeMasterComponent } from './DocTypeMaster.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DocTypeMasterRoutingModule
  ],
  declarations: [DocTypeMasterComponent],
  providers:[DatePipe]
})
export class DocTypeMasterModule { }
