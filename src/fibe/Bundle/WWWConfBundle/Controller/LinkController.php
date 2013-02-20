<?php

namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
//On insere l'entity Event  de simple schedule
use IDCI\Bundle\SimpleScheduleBundle\Entity\Event;
//On insere le controlleur de Event 
use SimpleScheduleBundle\Controller
/**
 * Link controller.
 *
 * @Route("/admin/link")
 */
class LinkController extends Controller
{
/**
 * @Route("/", name="wwwconf_link_index")
 * @Template()
 */
    public function indexAction()
    {
        return array();
    }
    
/**
 * @Route("/create", name="wwwconf_link_create")
 * @Template("IWWWConf:Bundle:Link:create.html.twig")
 */
    public function createAction()
    {
		
		 // On crée un objet Article
  $event = new Event();
 
  // On crée le FormBuilder grâce à la méthode du contrôleur
  $formBuilder = $this->createFormBuilder($event);
 
  /* On insere les champs dont on a besoin pour les publications 
  $formBuilder
    ->add('titre','text,array('label' => 'Titre Publication :'))
    ->add('auteur','text',array('label' => 'Auteur Publication :'))
    ->add('ID', 'text',array('label' => 'ID Publication :'));
	*/
  $form = $formBuilder ->getForm();
 
  // On passe la méthode createView() du formulaire à la vue afin qu'elle puisse afficher le formulaire toute seule
  return $this->render('fibeWWWConfBundle::create.html.twig', array(
    'form' => $form->createView(),
  ));
	
    }
    
/**
 * @Route("/list", name="wwwconf_link_list")
 * @Template("IWWWConf:Bundle:Link:list.html.twig)
 */
    public function listAction()
    {
	
		//Recuperer tous le evenements et les afficher
        return array();
    }
}
