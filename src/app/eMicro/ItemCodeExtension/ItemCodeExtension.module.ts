import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ItemCodeExtensionRoutingModule } from './ItemCodeExtension-routing.module';
import { ItemCodeExtensionComponent } from './ItemCodeExtension.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ItemCodeExtensionRoutingModule
    ],
    declarations: [
        ItemCodeExtensionComponent
    ]
})
export class ItemCodeExtensionModule { }
