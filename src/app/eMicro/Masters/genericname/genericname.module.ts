import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { GenericNameRoutingModule } from './genericname-routing.module';
import { GenericNameComponent } from './genericname.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        GenericNameRoutingModule
    ],
    declarations: [
        GenericNameComponent
    ]
})
export class GenericNameModule { }
