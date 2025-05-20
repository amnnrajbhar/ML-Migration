import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnauthorizedComponent } from './unauthorized.component';
import { UnauthorizedRoutingModule } from './unauthorized-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UnauthorizedRoutingModule
    ],
    declarations: [
        UnauthorizedComponent
    ]
})
export class UnauthorizedModule { }
