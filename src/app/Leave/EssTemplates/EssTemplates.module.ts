import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EssTemplatesComponent} from './EssTemplates.component'
import { FormsModule } from '@angular/forms';
import { EssTemplatesRoutingModule } from './EssTemplates-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    EssTemplatesRoutingModule,
  ],
  declarations: [
   EssTemplatesComponent,
],
})
export class EssTemplatesModule { }
