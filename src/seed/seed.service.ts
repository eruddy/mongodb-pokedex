import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';

@Injectable()
export class SeedService {
  constructor(private readonly pokemonService: PokemonService) {}
  private readonly axios: AxiosInstance = axios;
  async executeSeed() {
    //se puede realizar las peticiones con fetch axios y request
    const { data } = await this.axios.get<PokeResponse>(
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
