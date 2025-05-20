import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddProfileComponent } from './add-profile.component';
import { FormsModule } from '@angular/forms';
import { AddProfileRoutingModule } from './add-profile-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AddProfileRoutingModule
  ],
  declarations: [
    AddProfileComponent
  ]
})
export class AddProfileModule { }
