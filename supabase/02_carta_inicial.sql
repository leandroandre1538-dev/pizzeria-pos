-- =====================================================================
--  MAROCCHINO'S PIZZERIA - Carga inicial de la CARTA
--  Ejecutar DESPUES de 01_schema.sql
--  (Los frappes NO se incluyen: ya no se venden)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Usuario administrador
--   usuario: admin    clave: marocchinos2026
--   El hash es sha256('admin:marocchinos2026')
--   >>> Cambialo desde Admin > Usuarios apenas entres <<<
-- ---------------------------------------------------------------------
insert into usuarios (usuario, password_hash, nombre, rol) values
('admin', 'b8fce23a93a3dbc597c0e8811b9176beb725e04340873a0974b616cfe659a2ee', 'Administrador', 'admin');

-- ---------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------
insert into categorias (id, nombre, orden) values
(1, 'Pizzas Clasicas',  1),
(2, 'Pizzas Especiales',2),
(3, 'Combos',           3),
(4, 'Pan al Ajo',       4),
(5, 'Bebidas Frias',    5),
(6, 'Bebidas Calientes',6),
(7, 'Jugos',            7),
(8, 'Mojitos',          8);
select setval('categorias_id_seq', 8);

-- =====================================================================
-- PIZZAS CLASICAS  (personal 2 porciones / compartida 4 / familiar 8)
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, pizzas_equivalentes, permite_extras, orden) values
(1, 1, 'La Mozarella', 'Salsa de tomate y queso mozzarella.',                                        'pizza', 1, true, 1),
(2, 1, 'Napolitana',   'Salsa de tomate, queso mozzarella y aceitunas.',                             'pizza', 1, true, 2),
(3, 1, 'La Misia',     'Salsa de tomate, queso mozzarella y hot dog.',                               'pizza', 1, true, 3),
(4, 1, 'Americana',    'Salsa de tomate, queso mozzarella y jamon pizzero.',                         'pizza', 1, true, 4),
(5, 1, 'Choripizza',   'Salsa de tomate, queso mozzarella y chorizo argentino.',                     'pizza', 1, true, 5),
(6, 1, 'Espanola',     'Salsa de tomate, queso mozzarella, chorizo argentino y aceitunas.',          'pizza', 1, true, 6),
(7, 1, 'Vegetariana',  'Salsa de tomate, queso mozzarella, aros de cebolla, tomate en rodajas y champinones.', 'pizza', 1, true, 7),
(8, 1, 'Mixta',        'Salsa de tomate, queso mozzarella, hot dog, jamon pizzero y pimientos.',     'pizza', 1, true, 8),
(9, 1, 'Peperoni',     'Salsa de tomate, queso mozzarella y peperoni.',                              'pizza', 1, true, 9),
(10,1, 'Granjera',     'Salsa de tomate, queso mozzarella, jamon, champinones y aceituna.',          'pizza', 1, true, 10);

insert into variantes (producto_id, nombre, precio, orden) values
(1,'Personal',  7.00,1), (1,'Compartida',14.00,2), (1,'Familiar',20.00,3),
(2,'Personal',  8.00,1), (2,'Compartida',15.00,2), (2,'Familiar',21.00,3),
(3,'Personal',  9.00,1), (3,'Compartida',16.00,2), (3,'Familiar',22.00,3),
(4,'Personal',  9.00,1), (4,'Compartida',17.00,2), (4,'Familiar',23.00,3),
(5,'Personal', 10.00,1), (5,'Compartida',18.00,2), (5,'Familiar',23.00,3),
(6,'Personal', 10.00,1), (6,'Compartida',19.00,2), (6,'Familiar',24.00,3),
(7,'Personal', 12.00,1), (7,'Compartida',19.00,2), (7,'Familiar',25.00,3),
(8,'Personal', 12.00,1), (8,'Compartida',19.00,2), (8,'Familiar',25.00,3),
(9,'Personal', 12.00,1), (9,'Compartida',19.00,2), (9,'Familiar',25.00,3),
(10,'Personal',12.00,1),(10,'Compartida',20.00,2),(10,'Familiar',26.00,3);

-- =====================================================================
-- PIZZAS ESPECIALES
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, pizzas_equivalentes, permite_extras, orden) values
(11,2,'Alemana',      'Salsa de tomate, queso mozzarella, chorizo, tocino y hot dog.',                                'pizza',1,true,1),
(12,2,'Hawaiana',     'Salsa de tomate, queso mozzarella, jamon pizzero, pina y durazno.',                            'pizza',1,true,2),
(13,2,'Suprema',      'Salsa de tomate, queso mozzarella, peperoni, hot dog y tocino.',                               'pizza',1,true,3),
(14,2,'Italiana',     'Salsa de tomate, queso mozzarella, chorizo, tocino, aceituna, cebolla y pimientos.',           'pizza',1,true,4),
(15,2,'Marocchinos',  'Salsa de tomate, queso mozzarella, peperoni, hot dog, aceituna, tocino, pimientos y champinones.','pizza',1,true,5),
(16,2,'Puerca',       'Salsa de tomate, queso mozzarella, jamon pizzero, chorizo, hot dog, aceituna, tocino y pimientos.','pizza',1,true,6);

insert into variantes (producto_id, nombre, precio, orden) values
(11,'Personal',12.00,1),(11,'Compartida',20.00,2),(11,'Familiar',26.00,3),
(12,'Personal',12.00,1),(12,'Compartida',20.00,2),(12,'Familiar',26.00,3),
(13,'Personal',13.00,1),(13,'Compartida',20.00,2),(13,'Familiar',26.00,3),
(14,'Personal',14.00,1),(14,'Compartida',21.00,2),(14,'Familiar',27.00,3),
(15,'Personal',15.00,1),(15,'Compartida',26.00,2),(15,'Familiar',32.00,3),
(16,'Personal',15.00,1),(16,'Compartida',26.00,2),(16,'Familiar',32.00,3);

-- =====================================================================
-- COMBOS  (pidelas todos los dias)
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, pizzas_equivalentes, permite_extras, orden) values
(20,3,'Combo Pizzero 1','1 pizza americana familiar + coca/inka de 1 litro.','combo',1,false,1),
(21,3,'Combo Pizzero 2','1 pizza familiar a eleccion (hawaiana, peperoni, mixta o granjera) + coca/inka de 1 litro + pan al ajo.','combo',1,false,2),
(22,3,'Combo Pizzero 3','1 pizza americana familiar + 1 choripizza.','combo',2,false,3),
(23,3,'Combo Pizzero 4','2 pizzas americanas familiares + coca/inka de 1 litro + pan al ajo.','combo',2,false,4),
(24,3,'Combo Pizzero 5','2 x 43.00 - mozarella, misia, americana o choripizza.','combo',2,false,5),
(25,3,'Combo Pizzero 6','2 x 40.00 - mozarella, misia o napolitana.','combo',2,false,6),
(26,3,'Combo Pizzero Americanas','2 pizzas familiares + gaseosa coca o inka de 2 litros.','combo',2,false,7),
(27,3,'Combo Full Americanas','3 pizzas americanas familiares + 1 gaseosa de 2 litros coca/inka.','combo',3,false,8),
(28,3,'Combo Tu Escoges La Segunda','1 pizza americana + 1 pizza a eleccion (hawaiana, peperoni, mixta o granjera).','combo',2,false,9),
(29,3,'Combo Compartidas 1','2 pizzas compartidas a escoger (solo pizzas clasicas).','combo',2,false,10),
(30,3,'Combo Compartidas 2','1 pizza compartida + 1 pizza familiar a escoger (solo pizzas clasicas).','combo',2,false,11);

insert into variantes (producto_id, nombre, precio, orden) values
(20,'Combo',27.00,1),
(21,'Combo',34.00,1),
(22,'Combo',42.00,1),
(23,'Combo',52.00,1),
(24,'Combo 2x',43.00,1),
(25,'Combo 2x',40.00,1),
(26,'Combo',52.00,1),
(27,'Combo',74.00,1),
(28,'Combo',45.00,1),
(29,'Combo',36.00,1),
(30,'Combo',42.00,1);

-- =====================================================================
-- PAN AL AJO
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, orden) values
(40,4,'Pan al Ajo','Pan al ajo de la casa.','simple',1),
(41,4,'Pan al Ajo Especial','Pan al ajo con queso.','simple',2);

insert into variantes (producto_id, nombre, precio, orden) values
(40,'Media porcion',3.00,1),(40,'1 Porcion',6.00,2),
(41,'Media porcion',5.00,1),(41,'1 Porcion',9.00,2);

-- =====================================================================
-- BEBIDAS FRIAS
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, orden) values
(50,5,'Chicha Morada','Chicha morada de la casa.','simple',1),
(51,5,'Maracuya','Refresco de maracuya.','simple',2),
(52,5,'Coca Cola / Inka Cola','Gaseosa.','simple',3),
(53,5,'Agua Mineral','Agua mineral.','simple',4);

insert into variantes (producto_id, nombre, precio, orden) values
(50,'1/2 Litro',3.50,1),(50,'1 Litro',7.00,2),
(51,'1/2 Litro',3.50,1),(51,'1 Litro',7.00,2),
(52,'1/2 Litro',3.50,1),(52,'1 Litro',6.00,2),(52,'2 Litros',10.00,3),
(53,'Unidad',2.00,1);

-- =====================================================================
-- BEBIDAS CALIENTES
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, orden) values
(60,6,'Cafe','Cafe caliente.','simple',1),
(61,6,'Te','Te de manzanilla o puro.','simple',2);

insert into variantes (producto_id, nombre, precio, orden) values
(60,'Taza',2.00,1),
(61,'Taza',2.00,1);

-- =====================================================================
-- JUGOS
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, orden) values
(70,7,'Jugo de Mango','Jugo natural de mango.','simple',1),
(71,7,'Jugo de Fresa','Jugo natural de fresa.','simple',2),
(72,7,'Jugo de Pina','Jugo natural de pina.','simple',3);

insert into variantes (producto_id, nombre, precio, orden) values
(70,'Vaso',10.00,1),
(71,'Vaso',5.00,1),
(72,'Vaso',4.00,1);

-- =====================================================================
-- MOJITOS
-- =====================================================================
insert into productos (id, categoria_id, nombre, descripcion, tipo, orden) values
(80,8,'Mojito Clasico','Mojito clasico.','simple',1),
(81,8,'Mojito de Maracuya','Mojito de maracuya.','simple',2),
(82,8,'Mojito de Fresa','Mojito de fresa.','simple',3);

insert into variantes (producto_id, nombre, precio, orden) values
(80,'Vaso',12.00,1),
(81,'Vaso',15.00,1),
(82,'Vaso',15.00,1);

select setval('productos_id_seq', 100);

-- =====================================================================
-- EXTRAS (adicionales que se cobran aparte sobre una pizza)
-- =====================================================================
insert into extras (nombre, precio, orden) values
('Porcion de queso extra', 6.00, 1),
('1/2 porcion de queso',   3.00, 2),
('Jamon',                  3.00, 3),
('Chorizo',                3.00, 4),
('Peperoni',               4.00, 5),
('Tocino',                 4.00, 6),
('Pimenton',               1.00, 7),
('Aceituna',               1.00, 8),
('Cebolla',                1.00, 9);

-- =====================================================================
-- PROMOCIONES DE EJEMPLO (vigencia por fechas)
-- Ajusta fechas y valores desde Admin > Promociones
-- =====================================================================
insert into promociones (nombre, descripcion, tipo, valor, monto_minimo, fecha_inicio, fecha_fin, dias_semana, activo) values
('Martes Pizzero',      '10% de descuento en todo el pedido los martes.',        'porcentaje', 10, 0,  current_date, current_date + interval '90 days', '{2}',  true),
('Delivery Feliz',      'S/ 3.00 de descuento en pedidos desde S/ 40.',          'monto',       3, 40, current_date, current_date + interval '30 days', '{}',   true),
('Fin de Semana 15%',   '15% de descuento sabados y domingos desde S/ 50.',      'porcentaje', 15, 50, current_date, current_date + interval '60 days', '{6,7}',true);
