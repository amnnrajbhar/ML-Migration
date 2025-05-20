import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RulesMasterComponent } from './RulesMaster.component';
import { RulesMasterRoutingModule } from './RulesMaster-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    RulesMasterRoutingModule
  ],
  declarations: [
    RulesMasterComponent
  ],
  providers:[
    DatePipe
  ]
})
export class RulesMasterModule { }
