import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompOtRulescomponent } from './CompOtRules.component';
import { CompOtRulesRoutingModule } from './CompOtRules-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        CompOtRulesRoutingModule,
        HttpClientModule,RouterModule,
       
    ],
    declarations: [
         CompOtRulescomponent,
        
    ]
})
export class CompOtRulesModule { }