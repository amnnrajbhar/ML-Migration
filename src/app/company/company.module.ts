import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyComponent } from './company.component';
import { FormsModule } from '@angular/forms';
import { CompanyRoutingModule } from './company-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        CompanyRoutingModule
    ],
    declarations: [
        CompanyComponent
    ]
})
export class CompanyModule { }
