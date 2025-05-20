import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { CountryRoutingModule } from './Country-routing.module';
import { CountryComponent } from './Country.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        CountryRoutingModule
    ],
    declarations: [
        CountryComponent
    ]
})
export class CountryModule { }
