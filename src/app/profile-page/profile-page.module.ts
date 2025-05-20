import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilePageComponent } from './profile-page.component';
import { ProfilePageRoutingModule } from './profile-page-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ProfilePageRoutingModule
  ],
  declarations: [
    ProfilePageComponent
  ]
})
export class ProfilePageModule { }
