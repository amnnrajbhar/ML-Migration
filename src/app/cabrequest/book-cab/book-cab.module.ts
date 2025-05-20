import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookCabRoutingModule } from './book-cab-routing.module';
import { BookCabComponent } from './book-cab.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BookCabRoutingModule
  ],
  declarations: [
    BookCabComponent
  ]
})
export class BookCabModule { }
