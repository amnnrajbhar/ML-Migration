import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookGuesthouseComponent } from './book-guesthouse.component';
import { BookGuesthouseRoutingModule } from './book-guesthouse-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BookGuesthouseRoutingModule
  ],
  declarations: [
    BookGuesthouseComponent
  ]
})
export class BookGuesthouseModule { }
