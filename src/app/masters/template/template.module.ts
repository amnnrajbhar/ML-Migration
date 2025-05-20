import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './template.component';
import { FormsModule } from '@angular/forms';
import { TemplateRoutingModule } from './template-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TemplateRoutingModule
    ],
    declarations: [
        TemplateComponent
    ]
})
export class TemplateModule { }
