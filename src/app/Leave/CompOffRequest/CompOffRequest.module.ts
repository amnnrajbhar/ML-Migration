import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompOffRequestComponent } from './CompOffRequest.component';
import { FormsModule } from '@angular/forms';
import { CompOffRequestRoutingModule } from './CompOffRequest-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CompOffRequestRoutingModule,
  ],
  declarations: [
    CompOffRequestComponent
],
})
export class CompOffRequestModule { }
