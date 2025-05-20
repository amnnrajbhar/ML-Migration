import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CabrequestRoutingModule } from './cabrequest-routing.module';
import { BookCabComponent } from './book-cab/book-cab.component';
import { CabManagerapprovalComponent } from './cab-managerapproval/cab-managerapproval.component';
import { CabAdminapprovalComponent } from './cab-adminapproval/cab-adminapproval.component';

@NgModule({
  imports: [
    CommonModule,
    CabrequestRoutingModule
  ],
  declarations: []
})
export class CabrequestModule { }
