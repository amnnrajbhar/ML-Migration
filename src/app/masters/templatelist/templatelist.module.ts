import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateListComponent } from './templatelist.component';
import { FormsModule } from '@angular/forms';
import { TemplatelistRoutingModule } from './templatelist-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TemplatelistRoutingModule
    ],
    declarations: [
        TemplateListComponent
    ]
})
export class TemplatelistModule { }
