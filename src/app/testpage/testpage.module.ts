import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestpageComponent } from './testpage.component';
import { TestpageRoutingModule } from './testpage-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    TestpageRoutingModule
  ],
  declarations: [
    TestpageComponent
  ]
})
export class TestpageModule { }
