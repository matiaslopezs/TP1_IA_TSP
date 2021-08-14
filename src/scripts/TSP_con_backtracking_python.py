#!/usr/bin/env python
# coding: utf-8

# referencia: https://www.geeksforgeeks.org/travelling-salesman-problem-implementation-using-backtracking/

# In[1]:


# variables globales
respuesta = []
costo_min = 0


# In[2]:


# con esta versión de la función trataremos de guardar todos los caminos posibles
def tsp_multiple_solutions(grafo, v, posActual, n, contador, costo, camino):
    camino+= " "+ str(posActual)
    if (contador == n and grafo[posActual][0]):
        respuesta.append([costo + grafo[posActual][0],camino])
        return
    
    # BACKTRACKING STEP
    # by 1 and cost by graph[currPos][i] value
    for i in range(n):
        if(v[i] == False and grafo[posActual][i]):
            # Mark as visited
            v[i] = True
            tsp_multiple_solutions(grafo, v, i, n, contador + 1, costo + grafo[posActual][i], camino)
            # Mark ith node as unvisited
            v[i] = False


# In[3]:


# con esta versión de la función hallaremos una única solución que sea la ruta más optima
def tsp_backtracking(grafo, camino, pesoTotal, visitado, posActual, contador, n):
    global costo_min
    # vamos concatenando la ruta
    camino+= " "+ str(posActual)
    # print(costo_min)
    # si llegamos al último nodo y no estamos en el nodo inicial (ya que se debe volver al nodo inicial para terminar)
    if (contador == n  and grafo[posActual][0]):
        # si el costo mínimo es mejor de lo que tenemos hasta ahora o es 0
        if (costo_min > pesoTotal + grafo[posActual][0] or costo_min == 0):
            # para terminar sumamos al costo min el peso de volver al origen
            costo_min = pesoTotal + grafo[posActual][0]
            #  imprimimos el camino encontrado
            print(camino)
            return
    
    # este for recorre todos los caminos posibles con backtracking
    for i in range(n):
        if(visitado[i] == False and grafo[posActual][i]):
            visitado[i] = True
            tsp_backtracking(grafo, camino, pesoTotal + grafo[posActual][i], visitado, i, contador+1, n)
            visitado[i] = False


# In[4]:


# Código main
 
# n es el número de nodos
if __name__ == '__main__':
    n = 4
    grafo = [
        #[ 0, 10, 15, 20 ],
        #[ 10, 0, 35, 25 ],
        #[ 15, 35, 0, 30 ],
        #[ 20, 25, 30, 0 ]
        # otro grafo de prueba
        [0, 80, 55, 60],
        [80, 0, 27, 65],
        [55, 27, 0, 10],
        [60, 75, 10, 0]
    ]
    
    # array para ver nodos visitados
    # comienzan todos en falso
    v = [False for i in range(n)]
    
    # se visita el primer nodo (ya que es donde comienza el camino)
    v[0] = True
    
    # Find the minimum weight Hamiltonian Cycle (descomentar lo de abajo para usar esta función)
    tsp_multiple_solutions(grafo, v, 0, n, 1, 0,'')
    print("el menor costo y el mejor camino son: {}".format(min(respuesta)))
    respuesta.sort()
    print("mejores caminos ordenados: \n {}".format(respuesta))
    
     
    #funcion para hallar la ruta más optima (descomentar lo de abajo para usar esta función)
    # tsp_backtracking(grafo, '', 0, v, 0, 1, n)
    # print( "el último es el mejor camino, y el menor costo es: {}".format(costo_min) )

