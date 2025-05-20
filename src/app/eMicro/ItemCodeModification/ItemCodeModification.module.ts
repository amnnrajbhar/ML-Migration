import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ItemCodeModificationRoutingModule } from './ItemCodeModification-routing.module';
import { ItemCodeModificationComponent } from './ItemCodeModification.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ItemCodeModificationRoutingModule
    ],
    declarations: [
        ItemCodeModificationComponent
    ]
})
export class ItemCodeModificationModule { }
