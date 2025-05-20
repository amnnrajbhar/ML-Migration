import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { DocCategoryRoutingModule } from './DocCategory-routing.module';
import { DocCategoryComponent } from './DocCategory.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    DocCategoryRoutingModule
  ],
  declarations: [DocCategoryComponent],
  providers:[DatePipe]
})
export class DocCategoryModule { }
