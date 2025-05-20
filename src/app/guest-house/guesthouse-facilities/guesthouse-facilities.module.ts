import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuesthouseFacilitiesComponent } from './guesthouse-facilities.component';
import { GuesthouseFacilitiesRoutingModule } from './guesthouse-facilities-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GuesthouseFacilitiesRoutingModule
  ],
  declarations: [
    GuesthouseFacilitiesComponent
  ]
})
export class GuesthouseFacilitiesModule { }
