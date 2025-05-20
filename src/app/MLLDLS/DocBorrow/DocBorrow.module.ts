import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DocBorrowRoutingModule } from './DocBorrow-routing.module';
import { DocBorrowComponent } from './DocBorrow.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DocBorrowRoutingModule
  ],
  declarations: [DocBorrowComponent],
  providers:[DatePipe]
})
export class DocBorrowModule { }
