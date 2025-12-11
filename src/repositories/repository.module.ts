import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Repositories
import { AdminRepositoryService } from "./admin-repository/admin.repository";
import { UserRepositoryService } from "./user-repository/user.repository";
import { BatchRepositoryService } from "./batch-repository/batch-repository";

// Schemas
import { Admin, AdminSchema } from "src/schemas/admin.schema";
import { User, UserSchema } from "src/schemas/user.schema";
import { Batch, BatchSchema } from "src/schemas/batch.schema";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: User.name, schema: UserSchema },
            { name: Batch.name, schema: BatchSchema },
        ]),
    ],
    controllers: [],
    providers: [
        AdminRepositoryService,        
        UserRepositoryService,
        BatchRepositoryService
    ],
    exports: [
        AdminRepositoryService,        
        UserRepositoryService,
        BatchRepositoryService
    ],
})
export class RepositoryModule { }