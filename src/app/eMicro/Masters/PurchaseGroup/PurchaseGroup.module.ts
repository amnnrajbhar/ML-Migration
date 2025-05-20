import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
import { PurchaseGroupRoutingModule } from './PurchaseGroup-routing.module';
import { PurchaseGroupComponent } from './PurchaseGroup.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        PurchaseGroupRoutingModule
    ],
    declarations: [
        PurchaseGroupComponent
    ]
})
export class PurchaseGroupModule { }
