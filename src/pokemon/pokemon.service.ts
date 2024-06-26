import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
    private defaultLimit: number;
    constructor(
        @InjectModel(Pokemon.name)
        private readonly pokemonModel: Model<Pokemon>,
        private readonly configService: ConfigService,
    ) {
        console.log(process.env.PORT);
        this.defaultLimit = configService.get<number>('defaultLimit');
    }
    async insertMany(createPokemonDto: CreatePokemonDto[]) {
        // createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
        try {
            await this.pokemonModel.deleteMany({});
            const pokemon =
                await this.pokemonModel.insertMany(createPokemonDto);
            return pokemon;
        } catch (error) {
            this.handleExceptions(error);
        }
    }
    async create(createPokemonDto: CreatePokemonDto) {
        createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
        try {
            const pokemon = await this.pokemonModel.create(createPokemonDto);
            return pokemon;
        } catch (error) {
            this.handleExceptions(error);
        }
    }

    async findAll(paginationDto: PaginationDto) {
        //hacemos la desestructuracion y asignamos valores por defecto

        const { limit = this.defaultLimit, offset = 0 } = paginationDto;
        return await this.pokemonModel
            .find()
            .limit(limit)
            .skip(offset)
            .sort({ no: 1 })
            .select('-__v');
    }

    async findOne(term: string) {
        let pokemon: Pokemon;
        if (!isNaN(+term)) {
            pokemon = await this.pokemonModel.findOne({ no: term });
        }

        //MongoID
        if (!pokemon && isValidObjectId(term)) {
            pokemon = await this.pokemonModel.findById(term);
        }
        //Name
        if (!pokemon) {
            pokemon = await this.pokemonModel.findOne({
                name: term.toLocaleLowerCase(),
            });
        }
        if (!pokemon) {
            throw new NotFoundException(
                `Pokemon with id, name or no "${term}" not found`,
            );
        }

        return pokemon;
    }

    async update(term: string, updatePokemonDto: UpdatePokemonDto) {
        const pokemon = await this.findOne(term);
        if (updatePokemonDto.name) {
            updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
        }
        try {
            await pokemon.updateOne(updatePokemonDto);
        } catch (error) {
            this.handleExceptions(error);
        }

        return { ...pokemon.toJSON(), ...updatePokemonDto };
    }
    async remove(id: string) {
        // const pokemon = await this.findOne(id); // Añade await para esperar la resolución de la promesa
        // await pokemon.deleteOne(); // Ejecuta deleteOne en el objeto encontrado

        //busca y elimina el pokemon en una sola consulta pero lanza un falso positivo cuando no encuentra el pokemon a eliminar
        // const result = await this.pokemonModel.findByIdAndDelete(id);
        // return result;

        //deletedCount nos devuelve 0 si no se elimino un registro
        const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
        if (deletedCount === 0) {
            throw new BadRequestException(`Pokemon with id "${id}" not found`);
        }
        return;
    }

    handleExceptions(error: any) {
        if (error.code === 11000) {
            throw new BadRequestException(
                `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
            );
        }
        console.log(error);
        throw new InternalServerErrorException(
            `Caan't create Pokemon - Check server log`,
        );
    }
}
