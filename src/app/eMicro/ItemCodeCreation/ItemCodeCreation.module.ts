import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ItemCodeCreationRoutingModule } from './ItemCodeCreation-routing.module';
import { ItemCodeCreationComponent } from './ItemCodeCreation.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ItemCodeCreationRoutingModule
    ],
    declarations: [
        ItemCodeCreationComponent
    ],
    providers:[
        DatePipe
    ]
})
export class ItemCodeCreationModule { }
