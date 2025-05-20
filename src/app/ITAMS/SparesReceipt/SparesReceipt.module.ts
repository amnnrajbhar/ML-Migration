import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SparesReceiptComponent } from './SparesReceipt.component';
import { SparesReceiptRoutingModule } from './SparesReceipt-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        SparesReceiptRoutingModule
    ],
    declarations: [
        SparesReceiptComponent
    ]
})
export class SparesReceiptModule { }
