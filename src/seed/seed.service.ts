import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    //se puede realizar las peticiones con fetch axios y request
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    const pokemonToInsert: CreatePokemonDto[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // console.log({ name, no });
      // this.pokemonService.create({ name: name.toLowerCase(), no });
      pokemonToInsert.push({ name: name.toLowerCase(), no });
    });
    await this.pokemonService.insertMany(pokemonToInsert);
    return 'Seed Executed';
  }
}
